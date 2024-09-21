using System.Runtime.InteropServices;
using UnityEngine;

public class IframeCommunication : MonoBehaviour
{
    // Declare the SendMessageToParent function from the JavaScript plugin
#if UNITY_WEBGL
    [DllImport("__Internal")]
    private static extern void SendMessageToParent(string message);
#endif

    public void SendOutputToParent(string outputData)
    {
        Debug.Log("Sending data to parent: " + outputData);

        // Only call the JavaScript function if running in WebGL
#if UNITY_WEBGL
        SendMessageToParent(outputData);
#else
        Debug.LogWarning("SendMessageToParent is only supported in WebGL builds.");
#endif
    }

    public void ReceiveInputFromParent(string inputData)
    {
        Debug.Log("Received input from parent: " + inputData);
        // Handle the input data inside Unity
    }

    void Start()
    {
        // Optionally test communication on start
        SendOutputToParent("Hello from Unity!");
    }
}
